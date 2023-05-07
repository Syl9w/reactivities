using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Comments
{
    public class Create
    {
        public class Command : IRequest<Result<CommentDto>>
        {
            public string Body { get; set; }
            public Guid ActivityId { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Body).NotEmpty();
            }
        }

        public class Handler : IRequestHandler<Command, Result<CommentDto>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            private readonly IMapper _mapper;
            public Handler(DataContext context, IUserAccessor userAccessor, IMapper mapper)
            {
                _mapper = mapper;
                _context = context;
                _userAccessor = userAccessor;
            }

            public async Task<Result<CommentDto>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _context.Users
                    .Include(p => p.Photos)
                    .FirstOrDefaultAsync(u => u.UserName == _userAccessor.GetUsername());
                if (user == null) return null;

                var activity = await _context.Activities
                    .Include(x => x.Comments)
                    .ThenInclude(x => x.Author)
                    .ThenInclude(x => x.Photos)
                    .SingleOrDefaultAsync(a => a.Id == request.ActivityId);
                if (activity == null) return null;

                var comment = new Comment
                {
                    Body = request.Body,
                    Activity = activity,
                    Author = user,
                };

                activity.Comments.Add(comment);
                
                var success = await _context.SaveChangesAsync()>0;

                if(success) {
                    var result = _mapper.Map<CommentDto>(comment);
                    return Result<CommentDto>.Success(result);
                }

                return Result<CommentDto>.Failure("Failed to add a comment");
            }
        }
    }
}